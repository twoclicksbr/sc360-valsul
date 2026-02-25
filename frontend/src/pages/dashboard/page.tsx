import { Fragment } from 'react';
import { Container } from '@/components/common/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function DashboardPage() {
  return (
    <Fragment>
      <Container>
        <h1 className="text-xl font-semibold mb-5">Dashboard</h1>
        <Card>
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Em desenvolvimento</p>
          </CardContent>
        </Card>
      </Container>
    </Fragment>
  );
}
