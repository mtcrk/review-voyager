/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Text,
} from 'npm:@react-email/components@0.0.22'
import { BRAND_NAME, Header, Footer, main, container, h1, text, button, footerText } from './brand.tsx'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({ confirmationUrl }: SignupEmailProps) => (
  <Html lang="tr" dir="ltr">
    <Head />
    <Preview>{BRAND_NAME} hesabınızı doğrulayın</Preview>
    <Body style={main}>
      <Container style={container}>
        <Header />
        <Heading style={h1}>E-postanızı doğrulayın</Heading>
        <Text style={text}>
          {BRAND_NAME}'a hoş geldiniz! Hesabınızı aktifleştirmek için aşağıdaki
          butona tıklayın.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Hesabımı doğrula
        </Button>
        <Text style={footerText}>
          Bu hesabı siz oluşturmadıysanız bu e-postayı yok sayabilirsiniz.
        </Text>
        <Footer />
      </Container>
    </Body>
  </Html>
)

export default SignupEmail
