/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Link, Preview, Text,
} from 'npm:@react-email/components@0.0.22'
import { BRAND_NAME, Header, Footer, main, container, h1, text, link, button, footerText } from './brand.tsx'

interface EmailChangeEmailProps {
  siteName: string
  oldEmail: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  oldEmail,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="tr" dir="ltr">
    <Head />
    <Preview>{BRAND_NAME} e-posta değişikliğinizi onaylayın</Preview>
    <Body style={main}>
      <Container style={container}>
        <Header />
        <Heading style={h1}>E-posta değişikliğini onaylayın</Heading>
        <Text style={text}>
          {BRAND_NAME} hesabınızın e-posta adresini{' '}
          <Link href={`mailto:${oldEmail}`} style={link}>{oldEmail}</Link> adresinden{' '}
          <Link href={`mailto:${newEmail}`} style={link}>{newEmail}</Link> adresine
          değiştirme talebinde bulundunuz.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Değişikliği onayla
        </Button>
        <Text style={footerText}>
          Bu talebi siz oluşturmadıysanız lütfen hesabınızın güvenliğini hemen
          kontrol edin.
        </Text>
        <Footer />
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail
