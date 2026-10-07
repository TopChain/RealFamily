"""Publish only the data file to the configured parent website."""
import os,json,urllib.request,base64,pathlib
token=os.environ['PARENT_TOKEN'];url='https://api.github.com/repos/TopChain/topchainfresh-website/contents/realfamily/data/latest.json'
headers={'Authorization':'Bearer '+token,'Accept':'application/vnd.github+json','User-Agent':'RealFamily-updater'}
with urllib.request.urlopen(urllib.request.Request(url,headers=headers)) as response:current=json.load(response)
content=(pathlib.Path(__file__).resolve().parents[1]/'data/latest.json').read_bytes()
payload=json.dumps({'message':'Refresh Real Family verified sources','sha':current['sha'],'content':base64.b64encode(content).decode()}).encode()
with urllib.request.urlopen(urllib.request.Request(url,data=payload,headers=headers,method='PUT')) as response:print('Parent data synchronized:',response.status)
