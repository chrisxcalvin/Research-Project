export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
                <p className="text-muted-foreground mt-2">
                    Welcome back. Here is your health summary.
                </p>
            </div>

            {/* Content will go here - Stats cards etc */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <div className="text-sm font-medium text-muted-foreground">Recent Prescriptions</div>
                    <div className="text-2xl font-bold mt-2">12</div>
                </div>
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <div className="text-sm font-medium text-muted-foreground">Upcoming Doses</div>
                    <div className="text-2xl font-bold mt-2">3</div>
                </div>
            </div>
        </div>
    );
}
