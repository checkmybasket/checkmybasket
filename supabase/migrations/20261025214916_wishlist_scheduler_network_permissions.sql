-- The scheduler runs as postgres. Browser and general API roles must never use
-- pg_net's privileged network transport directly, regardless of exposed schemas.
revoke all on schema net from public,anon,authenticated,service_role;
revoke all on all functions in schema net from public,anon,authenticated,service_role;
revoke all on all tables in schema net from public,anon,authenticated,service_role;
