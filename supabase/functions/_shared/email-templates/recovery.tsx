/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Text,
} from 'npm:@react-email/components@0.0.22'
import { BRAND_NAME, Header, Footer, main, container, h1, text, button, footerText } from './brand.tsx'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({ confirmationUrl }: RecoveryEmailProps) => (
  <Html lang="tr" dir="ltr">
    <Head />
    <Preview>{BRAND_NAME} şifrenizi sıfırlayın</Preview>
    <Body style={main}>
      <Container style={container}>
        <Header />
        <Heading style={h1}>Şifrenizi sıfırlayın</Heading>
        <Text style={text}>
          {BRAND_NAME} hesabınız için şifre sıfırlama talebi aldık. Yeni şifre
          belirlemek için aşağıdaki butona tıklayın.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Yeni şifre belirle
        </Button>
        <Text style={footerText}>
          Bu talebi siz oluşturmadıysanız bu e-postayı yok sayabilirsiniz;
          şifreniz değişmeyecek.
        </Text>
        <Footer />
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail
