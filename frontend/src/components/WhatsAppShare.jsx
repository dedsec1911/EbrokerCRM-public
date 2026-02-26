import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { MessageCircle, Copy } from 'lucide-react';

export default function WhatsAppShare({ propertyId }) {
  const [loading, setLoading] = useState(false);

  const handleShare = async (type) => {
    setLoading(true);
    try {
      const response = await axios.post('/whatsapp/generate-message', {
        property_id: propertyId,
      });

      const { message, whatsapp_url } = response.data;

      if (type === 'open') {
        window.open(whatsapp_url, '_blank');
      } else if (type === 'copy') {
        await navigator.clipboard.writeText(message);
        toast.success('Message copied to clipboard!');
      }
    } catch (error) {
      toast.error('Failed to generate WhatsApp message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={() => handleShare('open')}
        className="w-full bg-[#25D366] hover:bg-[#1da851] text-white"
        disabled={loading}
        data-testid="whatsapp-share-btn"
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        {loading ? 'Generating...' : 'Share on WhatsApp'}
      </Button>

      <Button
        onClick={() => handleShare('copy')}
        variant="outline"
        className="w-full"
        disabled={loading}
        data-testid="copy-message-btn"
      >
        <Copy className="w-4 h-4 mr-2" />
        Copy Message
      </Button>
    </div>
  );
}