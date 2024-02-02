'use client'

import { useState } from "react";
import { toast } from 'sonner'
import { Toaster } from "@/components/ui/sonner"

import * as fal from "@fal-ai/serverless-client"

fal.config({
  proxyUrl: "/api/fal",
})

export default function Home() {
  const [input, setInput] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [videos, setVideos] = useState<any>([])

  async function getPrompt() {
    let link = "http://fleek-test.network/services/1/ipfs/QmNdUvAWYTbkmnfv88HVX4o6A3Q1KcnUjAy9GedCjH6b8v"
    const httpsLink = link.replace(
      "http://fleek-test.network",
      "https://for-browser.fleektester.com"
    )
    const prompt = await fetch(httpsLink).then(res => res.text())
    setInput(prompt)
  }

  async function createVideo() {
    try {
      if (!input) {
        toast('Please enter a description for your video.')
        return
      }
      scroll()
      setIsGenerating(true)
      let imageToUpload = await createImage()
      const result = await fal.subscribe('fal-ai/svd', {
        input: {
          image_url: imageToUpload
        },
        logs: true,
      }) as any
      console.log('result:', result)
      if (result.image) {
        setVideos([
          {
            prompt: input,
            gif: result.image
          },
          ...videos,
      ])
      }
      setIsGenerating(false)
    } catch (err) {
      console.log('error:', err)
      setIsGenerating(false)
    }
  }

  async function createImage() {
    try {
      const result = await fal.subscribe("fal-ai/fast-sdxl", {
        input: {
          prompt: input,
          image_size: 'square_hd'
        },
        logs: true,
      }) as any
      if (result.images[0]) {
        console.log('image created ... now creating video.')
        return result.images[0].url
      }
    } catch (err) {
      console.error(err)
      toast('Error creating image')
      setIsGenerating(false)
    }
  }  

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="flex flex-col">
        <p className="text-xl font-semibold">Describe your video</p>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="rounded-lg my-3 border-2 border-gray-300 p-2 w-96"
        />
        <button
        className="flex justify-center bg-blue-500 text-white p-2 ml-2 rounded-xl"
        onClick={createVideo}
        >
          {
          isGenerating && (
            <img
            src="/loading.svg"
            className="animate-spin w-6 h-6 mr-2" />
            )
        }
          Create
        </button>
        <button
        className="bg-green-500 mt-2 text-white p-2 ml-2 rounded-xl"
        onClick={getPrompt}
        >
          Generate idea
        </button>
      </div>
      <div className="mt-4">
        {
          videos.map((video, index) => (
            video.gif && (
              <a key={index} href={video.gif.url} target='_blank' rel="no-opener">
                <img
                  className='
                  mt-3
                  w-full rounded-lg cursor-pointer
                  sm:w-[700px] 
                  '
                  src={video.gif.url}
                />
              </a>
              )
          ))
        }
      </div>
      <Toaster />
    </main>
  );
}
