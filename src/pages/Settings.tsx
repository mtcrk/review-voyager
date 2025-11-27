import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Settings() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-muted/30">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="business">Business Info</TabsTrigger>
          <TabsTrigger value="google">Google Integration</TabsTrigger>
          <TabsTrigger value="auto-reply">Auto Reply</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="john@example.com" />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Info Tab */}
        <TabsContent value="business" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Manage your business details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input id="businessName" placeholder="My Business" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="placeId">Google Place ID</Label>
                <Input id="placeId" placeholder="ChIJ..." />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Google Integration Tab */}
        <TabsContent value="google" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Google Business Integration</CardTitle>
              <CardDescription>Connect to your Google Business Profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-foreground">Connection Status</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your Google Business account status
                    </p>
                  </div>
                  <Badge variant="secondary">Not Connected</Badge>
                </div>
                <Button className="w-full">Connect Google Business</Button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/10">
                  <span className="text-sm text-muted-foreground">Account</span>
                  <span className="text-sm font-medium">-</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/10">
                  <span className="text-sm text-muted-foreground">Location ID</span>
                  <span className="text-sm font-medium">-</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/10">
                  <span className="text-sm text-muted-foreground">Last Synced</span>
                  <span className="text-sm font-medium">Never</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Auto Reply Tab */}
        <TabsContent value="auto-reply" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Auto Reply Settings</CardTitle>
              <CardDescription>Configure automated responses</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Configure auto-reply settings in the Auto Reply page.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Notification settings coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
