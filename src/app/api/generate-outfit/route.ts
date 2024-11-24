import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@gradio/client'

export const maxDuration = 60 // Changed from 300 to 60 seconds to comply with Vercel hobby plan limits
export const dynamic = 'force-dynamic' // Disable static optimization

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function predictWithRetry(client: any, endpoint: string, params: any, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`Attempt ${i + 1}: Sending request to ${endpoint}`)
      
      // Make the prediction with the prepared files
      console.log('Making prediction with params:', {
        ...params,
        vton_img: params.vton_img ? 'File data...' : null,
        garm_img: params.garm_img ? 'File data...' : null
      })
      
      const result = await client.predict(endpoint, params)
      return result
    } catch (error: any) {
      console.error(`Attempt ${i + 1} failed:`, error)
      
      // Parse quota error message
      const quotaMatch = error?.message?.match(/retry in (\d+):(\d+):(\d+)/)
      if (quotaMatch) {
        const [_, hours, minutes, seconds] = quotaMatch
        const waitTimeMs = ((Number(hours) * 60 * 60) + (Number(minutes) * 60) + Number(seconds)) * 1000
        
        if (i === maxRetries - 1) {
          throw new Error(`GPU quota exceeded. Please try again in ${hours}h ${minutes}m ${seconds}s`)
        }
        
        console.log(`GPU quota exceeded, waiting for ${hours}h ${minutes}m ${seconds}s...`)
        await delay(waitTimeMs + 1000) // Add 1 second buffer
        continue
      }
      
      // If we're on the last retry, throw the error
      if (i === maxRetries - 1) {
        throw new Error(`Failed after ${maxRetries} attempts: ${error.message || JSON.stringify(error)}`)
      }
      
      // Otherwise wait and retry
      const waitTime = 5000 * (i + 1) // Exponential backoff
      console.log(`Retrying in ${waitTime/1000} seconds...`)
      await delay(waitTime)
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    
    const modelImage = formData.get('modelImage') as File
    const garmentImage = formData.get('garmentImage') as File
    const category = formData.get('category') as string
    
    if (!modelImage || !garmentImage) {
      return NextResponse.json(
        { error: 'Model image and garment image are required' },
        { status: 400 }
      )
    }

    // Keep files as Files instead of converting to Blobs
    console.log('Creating Gradio client...')
    const client = await Client.connect('levihsu/OOTDiffusion', {
      hf_token:process.env.HUGGING_FACE_TOKEN,
    })
    console.log('Gradio client connected successfully')

    const endpoint = category ? "/process_dc" : "/process_hd"
    const params = {
      vton_img: modelImage, // Use File directly
      garm_img: garmentImage, // Use File directly
      ...(category && { category }), // Add category if present
      n_samples: Number(formData.get('nSamples')),
      n_steps: Number(formData.get('nSteps')),
      image_scale: Number(formData.get('imageScale')),
      seed: Number(formData.get('seed'))
    }

    console.log('Sending prediction request...')
    const result = await predictWithRetry(client, endpoint, params)
    
    console.log('Raw result:', result)
    console.log('Result type:', typeof result)
    
    // Handle the response data
    let imageData = null
    if (result?.data && Array.isArray(result.data) && result.data[0]?.[0]?.image?.url) {
      imageData = result.data[0][0].image.url
    }

    if (!imageData) {
      throw new Error('No image data received from the model')
    }

    console.log('Image data:', imageData)

    return NextResponse.json({ 
      result: imageData,
      success: true 
    })
  } catch (error) {
    console.error('Detailed error information:', {
      name: error instanceof Error ? error.name : 'Unknown Error',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      cause: error instanceof Error ? (error as Error & { cause?: unknown }).cause : undefined
    })
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to process model response',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
        success: false 
      },
      { status: 500 }
    )
  }
}

// Test script to verify token
const testToken = async () => {
  const response = await fetch('https://huggingface.co/api/whoami', {
    headers: {
      Authorization: `Bearer ${process.env.HUGGING_FACE_TOKEN}`
    }
  })
  const data = await response.json()
  console.log('Token test result:', data)
}

