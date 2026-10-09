import datetime,json,os,pathlib,sys,tempfile,unittest
from unittest.mock import patch
sys.path.insert(0,str(pathlib.Path(__file__).resolve().parents[1]))
import generate_english as g
class GenerationTests(unittest.TestCase):
    def test_no_api_without_confirmed_free_project_and_mode(self):
        with patch.dict(os.environ,{'GEMINI_API_KEY':'test','GEMINI_GENERATION_MODE':'paid'},clear=True):
            with self.assertRaises(AssertionError):g.free_access()
    def test_two_request_cap_survives_a_fresh_run(self):
        with tempfile.TemporaryDirectory() as folder,patch.object(g,'ROOT',pathlib.Path(folder)):
            (g.ROOT/'data').mkdir();g.reserve_request('2026-10-09');g.reserve_request('2026-10-09')
            with self.assertRaises(AssertionError):g.reserve_request('2026-10-09')
    def test_paused_quota_never_retries(self):
        with tempfile.TemporaryDirectory() as folder,patch.object(g,'ROOT',pathlib.Path(folder)):
            (g.ROOT/'data').mkdir();(g.ROOT/'data/english-generation-status.json').write_text('{"paused":true}')
            with self.assertRaises(AssertionError):g.reserve_request('2026-10-09')
    def test_existing_complete_dates_do_not_call_gemini(self):
        with patch.object(g,'generate',side_effect=AssertionError('No API should run')):
            day=datetime.datetime.now(g.PACIFIC).date()
            g.prepare(day.isoformat());g.prepare((day+datetime.timedelta(days=1)).isoformat())
if __name__=='__main__':unittest.main()
