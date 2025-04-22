"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '@/trpc/react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

type FormInput = {
  repoUrl: string,
  projectName: string,
  githubToken?: string,
}


const CreateProjectPage = () => {
  const { register, handleSubmit, reset } = useForm<FormInput>()
  const createProject = api.project.createProject.useMutation()

  function onSubmit(data: FormInput) {
    createProject.mutate({
      repoUrl: data.repoUrl,
      projectName: data.projectName,
      githubToken: data.githubToken,
    }, {
      onSuccess: () => {
        toast.success('Project created successfully')
      },
      onError: () => {
        toast.error('Error creating project:')
      }
    })
    console.log(data)
    reset();
  }

  return (
    <div className='flex items-center gap-12 h-full justify-center'>
      <img src={'/logo.svg'} className='h-56 w-auto' />
      <div>
        <div>
          <h1 className='font-semibold text-2xl'>
            Link your repository to get started.
          </h1>
          <p className='text-sm text-muted-foreground'>
            Enter your repository URL and project name.
          </p>
          <div className="h-4"></div>
          <div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Input
                {...register('projectName', { required: true })}
                placeholder='Project Name'
                required
              >
              </Input>
              <div className="h-2"></div>
              <Input
                {...register('repoUrl', { required: true })}
                placeholder='Repository URL'
                type='url'
                required
              >
              </Input>
              <div className="h-2"></div>
              <Input
                {...register('githubToken')}
                placeholder='Github Token (Optional)'
              />
              <div className="h-4"></div>
              <Button type='submit'>
                Create Project
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateProjectPage;

