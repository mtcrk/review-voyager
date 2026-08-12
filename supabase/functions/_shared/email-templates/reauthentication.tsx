/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text,
} from 'npm:@react-email/components@0.0.22'
import { BRAND_NAME, Header, Footer, main, container, h1, text, codeStyle, footerText } from './brand.tsx'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="tr" dir="ltr">
    <Head />
    <Preview>{BRAND_NAME} doğrulama kodunuz</Preview>
    <Body style={main}>
      <Container style={container}>
        <Header />
        <Heading style={h1}>Kimliğinizi doğrulayın</Heading>
        <Text style={text}>Aşağıdaki kodu kullanarak işleminizi onaylayın:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footerText}>
          Bu kod kısa süre içinde geçerliliğini yitirir. Bu talebi siz
          oluşturmadıysanız e-postayı yok sayabilirsiniz.
        </Text>
        <Footer />
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail
