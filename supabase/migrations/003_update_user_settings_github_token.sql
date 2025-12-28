ALTER TABLE user_settings 
  RENAME COLUMN github_mcp_server_url TO github_access_token;

COMMENT ON COLUMN user_settings.github_access_token IS 'GitHub Personal Access Token for API authentication';
