
TRUNCATE TABLE
  public.reply_logs,
  public.reviews,
  public.chat_messages,
  public.chat_conversations,
  public.tiktok_comment_replies,
  public.tiktok_reply_suggestions,
  public.tiktok_comments,
  public.tiktok_videos,
  public.email_logs,
  public.email_campaigns,
  public.customer_contacts,
  public.story_kit_shares,
  public.story_kit_templates,
  public.integration_logs,
  public.performance_metrics_cache,
  public.social_connection_credentials,
  public.social_connections,
  public.business_credentials,
  public.businesses,
  public.profiles,
  public.demo_requests
RESTART IDENTITY CASCADE;
