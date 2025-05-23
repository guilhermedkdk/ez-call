import {
  Button,
  Heading,
  MultiStep,
  Text,
  TextInput,
  TextInputProps,
} from '@ignite-ui/react'
import { forwardRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import { AxiosError } from 'axios'
import { z } from 'zod'

import { api } from '@/lib/axios'
import { ArrowRight } from 'phosphor-react'

import { Container, Form, FormError, Header } from './styles'

const registerFormSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'O usuário precisa ter ao menos 3 letras.' })
    .regex(/^([a-z\\-]+)$/i, {
      message: 'O usuário pode ter apenas letras e hífens.',
    })
    .transform((username) => username.toLowerCase()),
  name: z.string().min(3, { message: 'O nome precisa ter ao menos 3 letras.' }),
})

type RegisterFormData = z.infer<typeof registerFormSchema>

export default function Register() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
  })

  const router = useRouter()

  useEffect(() => {
    if (router.query.username) {
      setValue('username', String(router.query.username))
    }
  }, [router.query?.username, setValue])

  async function handleRegister(data: RegisterFormData) {
    try {
      await api.post('/users', {
        name: data.name,
        username: data.username,
      })

      await router.push('/register/connect-calendar')
    } catch (error) {
      if (error instanceof AxiosError && error?.response?.data?.message) {
        alert(error.response.data.message)
        return
      }

      console.log(error)
    }
  }

  const CustomTextInput = forwardRef<HTMLInputElement, TextInputProps>(
    (props, ref) => {
      return (
        <TextInput
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          crossOrigin={undefined}
          ref={ref}
          {...props}
        />
      )
    },
  )
  CustomTextInput.displayName = 'CustomTextInput'

  return (
    <>
      <NextSeo title="Crie uma conta | EZ Call" />

      <Container>
        <Header>
          <Heading as="strong">Bem-vindo ao EZ Call!</Heading>
          <Text>
            Precisamos de algumas informações para criar seu perfil! Ah, você
            pode editar essas informações depois.
          </Text>

          <MultiStep size={4} currentStep={1} />
        </Header>

        <Form as="form" onSubmit={handleSubmit(handleRegister)}>
          <label>
            <Text size="sm">Nome de usuário</Text>
            <CustomTextInput
              prefix="ignite.com/"
              placeholder="seu-usuário"
              {...register('username')}
            />

            {errors.username && (
              <FormError size="sm">{errors.username.message}</FormError>
            )}
          </label>

          <label>
            <Text size="sm">Nome completo</Text>
            <CustomTextInput placeholder="Seu nome" {...register('name')} />

            {errors.name && (
              <FormError size="sm">{errors.name.message}</FormError>
            )}
          </label>

          <Button type="submit" disabled={isSubmitting}>
            Próximo passo
            <ArrowRight />
          </Button>
        </Form>
      </Container>
    </>
  )
}
