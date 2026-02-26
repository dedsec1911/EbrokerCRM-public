import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Phone, Calendar } from 'lucide-react';
import Layout from '@/components/Layout';

export default function LeadsPage() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await axios.get('/leads');
      setLeads(response.data);
    } catch (error) {
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="p-4 md:p-8 max-w-6xl mx-auto">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="mb-6"
          data-testid="back-btn"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <h1 className="text-3xl font-bold mb-6" data-testid="leads-page">All Leads</h1>

        {leads.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No leads yet</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="leads-list">
            {leads.map((lead) => (
              <Card key={lead.id} className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold" data-testid={`lead-name-${lead.id}`}>{lead.client_name}</h3>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Phone className="w-3 h-3 mr-1" />
                        <span data-testid={`lead-phone-${lead.id}`}>{lead.client_phone}</span>
                      </div>
                    </div>
                    <Badge variant="outline" data-testid={`lead-status-${lead.id}`}>{lead.status}</Badge>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-1">Requirements:</p>
                    <p className="text-sm" data-testid={`lead-requirements-${lead.id}`}>{lead.requirements}</p>
                  </div>

                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>Created: {new Date(lead.created_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}