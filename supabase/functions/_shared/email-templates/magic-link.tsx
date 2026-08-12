/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Text,
} from 'npm:@react-email/components@0.0.22'
import { BRAND_NAME, Header, Footer, main, container, h1, text, button, footerText } from './brand.tsx'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({ confirmationUrl }: MagicLinkEmailProps) => (
  <Html lang="tr" dir="ltr">
    <Head />
    <Preview>{BRAND_NAME} giriş bağlantınız</Preview>
    <Body style={main}>
      <Container style={container}>
        <Header />
        <Heading style={h1}>Giriş bağlantınız hazır</Heading>
        <Text style={text}>
          {BRAND_NAME} hesabınıza giriş yapmak için aşağıdaki butona tıklayın.
          Bu bağlantı kısa süre içinde geçerliliğini yitirir.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Giriş yap
        </Button>
        <Text style={footerText}>
          Bu bağlantıyı siz istemediyseniz bu e-postayı yok sayabilirsiniz.
        </Text>
        <Footer />
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail
