"""One-time cloud exchange. Never print OAuth credentials or Google responses."""
import json,os,pathlib,subprocess,urllib.parse,urllib.request,urllib.error

def main():
    body=urllib.parse.urlencode({'client_id':os.environ['GMAIL_CLIENT_ID'],'client_secret':os.environ['GMAIL_CLIENT_SECRET'],'code':os.environ['GMAIL_AUTHORIZATION_CODE'],'code_verifier':os.environ['GMAIL_PKCE_VERIFIER'],'redirect_uri':'http://127.0.0.1:8769/callback','grant_type':'authorization_code'}).encode()
    req=urllib.request.Request('https://oauth2.googleapis.com/token',data=body,headers={'Content-Type':'application/x-www-form-urlencoded'})
    try:
        with urllib.request.urlopen(req,timeout=30) as r:result=json.load(r)
        scopes=set(result.get('scope','').split())
        required={'https://www.googleapis.com/auth/gmail.send','https://www.googleapis.com/auth/gmail.readonly'}
        if not required.issubset(scopes) or not result.get('refresh_token'):raise ValueError('Missing permissions')
        req=urllib.request.Request('https://gmail.googleapis.com/gmail/v1/users/me/profile',headers={'Authorization':'Bearer '+result['access_token']})
        with urllib.request.urlopen(req,timeout=30) as r:profile=json.load(r)
        if profile.get('emailAddress','').lower()!='topchainfresh@gmail.com':raise ValueError('Wrong sender')
        subprocess.run(['openssl','pkeyutl','-encrypt','-pubin','-inkey','scripts/oauth/bootstrap-public.pem','-pkeyopt','rsa_padding_mode:oaep','-pkeyopt','rsa_oaep_md:sha256','-out','gmail-refresh.enc'],input=result['refresh_token'].encode(),check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    except urllib.error.HTTPError as exc:
        try:reason=json.loads(exc.read()).get('error','unknown')
        except Exception:reason='unknown'
        if reason not in {'invalid_client','invalid_grant','invalid_request','unauthorized_client','access_denied'}:reason='provider_request_failed'
        raise SystemExit('OAuth exchange failed: '+reason+'. No credentials or provider details are printed.') from None
    except Exception:raise SystemExit('OAuth validation or encryption failed; no credentials are printed.') from None
    print('Sender and both Gmail permissions verified. Refresh credential encrypted for private installation.')

if __name__=='__main__':main()
