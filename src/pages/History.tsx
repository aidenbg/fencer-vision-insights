import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface Row {
  id: string;
  name: string;
  status: string;
  created_at: string;
}

const statusBadge = (status: string) => {
  if (status === 'Complete') return <Badge className="bg-success text-success-foreground"><CheckCircle2 className="h-3 w-3 mr-1" />Complete</Badge>;
  if (status === 'Failed') return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
  return <Badge variant="secondary"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Processing</Badge>;
};

const History = () => {
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    (async () => {
      // Ensure at least an anon session so RLS lets us read our own uploads
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) await supabase.auth.signInAnonymously();

      const { data } = await supabase
        .from('videos')
        .select('id, name, status, created_at')
        .order('created_at', { ascending: false });
      setRows((data as Row[]) ?? []);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <nav className="p-6 border-b">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Button variant="ghost" asChild>
            <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to Home</Link>
          </Button>
          <Link to="/upload" className="text-muted-foreground hover:text-foreground transition-colors">
            New Analysis
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Analysis History</h1>

        {rows === null ? (
          <div className="text-center py-20 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            Loading…
          </div>
        ) : rows.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            No analyses yet.{' '}
            <Link to="/upload" className="text-primary underline">Upload your first video</Link>.
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{new Date(r.created_at).toLocaleString()}</TableCell>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell>{statusBadge(r.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/upload?id=${r.id}`}>View Analysis</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  );
};

export default History;
