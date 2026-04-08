FROM payramapp/payram:latest

# Patch Payram web bundle fallback that forces browser calls to :8443/:8080.
# We remove the dynamic port suffix so requests stay on the current origin/port.
RUN set -eux; \
    find /web/.next/static/chunks -type f -name '*.js' -print0 \
      | xargs -0 sed -i 's/:${"https:"===e?"8443":"8080"}//g'; \
    find /web/.next/static/chunks -type f -name '*.js' -print0 \
      | xargs -0 sed -i 's#${e.serverUrl}${r?":8080":""}/api/v1/ws?page_id=global&clientID=${e.clientId}&token=${e.token}#${window.location.origin.replace(/^http/,"ws")}/api/v1/ws?page_id=global&clientID=${e.clientId}&token=${e.token}#g'; \
    find /web/.next/static/chunks -type f -name '*.js' -print0 \
      | xargs -0 sed -i 's#${e.serverUrl}${r?":8080":""}/api/v1/ws#${window.location.origin.replace(/^http/,"ws")}/api/v1/ws#g'; \
    find /web/.next/static/chunks -type f -name '*.js' -print0 \
      | xargs -0 sed -i 's#ws://#wss://#g'; \
    find /web/.next/static/chunks -type f -name '*.js' -print0 \
      | xargs -0 sed -i 's#:8080/api/v1/ws#/api/v1/ws#g'
