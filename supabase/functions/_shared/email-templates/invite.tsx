/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Text,
} from 'npm:@react-email/components@0.0.22'
import { BRAND_NAME, Header, Footer, main, container, h1, text, button, footerText } from './brand.tsx'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({ confirmationUrl }: InviteEmailProps) => (
  <Html lang="tr" dir="ltr">
    <Head />
    <Preview>{BRAND_NAME} ekibine davet edildiniz</Preview>
    <Body style={main}>
      <Container style={container}>
        <Header />
        <Heading style={h1}>Davet edildiniz</Heading>
        <Text style={text}>
          {BRAND_NAME}'da bir ekibe katılmaya davet edildiniz. Daveti kabul edip
          hesabınızı oluşturmak için aşağıdaki butona tıklayın.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Daveti kabul et
        </Button>
        <Text style={footerText}>
          Böyle bir davet beklemiyorduysanız bu e-postayı yok sayabilirsiniz.
        </Text>
        <Footer />
      </Container>
    </Body>
  </Html>
)

export default InviteEmail
