import pathlib,sys,unittest
from unittest.mock import patch
sys.path.insert(0,str(pathlib.Path(__file__).resolve().parents[1]))
import cloud_mail as relay
class DeliveryTests(unittest.TestCase):
    def setUp(self):self.job={'id':1,'recipient':'reader@example.com','subject':'Daily','html':'<h1>Daily</h1>'}
    def test_sent_message_is_not_sent_twice(self):
        with patch.object(relay,'find_sent',return_value='existing'),patch.object(relay,'api') as send,patch.object(relay,'queue') as queue:
            self.assertTrue(relay.deliver('access',self.job,'lease'));send.assert_not_called();self.assertEqual(queue.call_args.args[1]['messageId'],'existing')
    def test_ambiguous_delivery_is_not_retried_blindly(self):
        self.job['prior_status']='uncertain'
        with patch.object(relay,'find_sent',return_value=None),patch.object(relay,'api') as send,patch.object(relay,'queue') as queue:
            self.assertFalse(relay.deliver('access',self.job,'lease'));send.assert_not_called();self.assertEqual(queue.call_args.args[1]['status'],'uncertain')
    def test_unsubscribed_reader_is_not_sent_mail(self):
        with patch.object(relay,'find_sent',return_value=None),patch.object(relay,'api') as send,patch.object(relay,'queue',return_value={'allowed':False}):
            self.assertFalse(relay.deliver('access',self.job,'lease'));send.assert_not_called()
    def test_network_failure_preserves_uncertain_status(self):
        with patch.object(relay,'find_sent',return_value=None),patch.object(relay,'queue',return_value={'allowed':True}) as queue,patch.object(relay,'api',side_effect=TimeoutError):
            with self.assertRaises(TimeoutError):relay.deliver('access',self.job,'lease')
            self.assertEqual(queue.call_args.args[1]['status'],'uncertain')
if __name__=='__main__':unittest.main()
