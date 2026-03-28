import KanbanBoard from "@/components/admin/KanbanBoard";

export const metadata = {
    title: "Kitchen Dashboard - French Cartel",
};

export default function AdminPage() {
    return (
        <main className="bg-background min-h-screen">
            <KanbanBoard />
        </main>
    );
}
