/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Img, Section, Text, Link } from 'npm:@react-email/components@0.0.22'

export const BRAND_NAME = 'VoyageRespond'
export const BRAND_URL = 'https://voyagerespond.com'
export const LOGO_URL =
  'https://pnpuhewfoxssmbpryart.supabase.co/storage/v1/object/public/email-assets/logo.png?v=2'

export const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
}
export const container = {
  padding: '32px 28px',
  maxWidth: '560px',
  margin: '0 auto',
}
export const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#1a1a2e',
  margin: '0 0 16px',
}
export const text = {
  fontSize: '15px',
  color: '#4b5563',
  lineHeight: '1.6',
  margin: '0 0 20px',
}
export const link = { color: '#7A5AF8', textDecoration: 'underline' }
export const button = {
  backgroundColor: '#7A5AF8',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  borderRadius: '10px',
  padding: '14px 28px',
  textDecoration: 'none',
  display: 'inline-block',
}
export const codeStyle = {
  fontFamily: 'Courier, monospace',
  fontSize: '26px',
  letterSpacing: '4px',
  fontWeight: 'bold' as const,
  color: '#7A5AF8',
  margin: '0 0 28px',
}
export const footerText = {
  fontSize: '12px',
  color: '#9ca3af',
  lineHeight: '1.6',
  margin: '28px 0 0',
}

export const Header = () => (
  <Section style={{ margin: '0 0 24px' }}>
    <Link href={BRAND_URL}>
      <Img src={LOGO_URL} width="36" height="36" alt={BRAND_NAME} />
    </Link>
  </Section>
)

export const Footer = () => (
  <Section style={{ borderTop: '1px solid #f0f0f0', margin: '32px 0 0' }}>
    <Text style={footerText}>
      {BRAND_NAME} · Yorumlarınızı yapay zekâ ile yönetin
      <br />
      <Link href={BRAND_URL} style={link}>
        voyagerespond.com
      </Link>
    </Text>
  </Section>
)
