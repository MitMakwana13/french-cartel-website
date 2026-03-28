import MenuManager from "@/components/admin/MenuManager";

export const metadata = {
    title: "Menu Manager - French Cartel",
};

export default function AdminMenuPage() {
    return (
        <main className="bg-background min-h-screen">
            <MenuManager />
        </main>
    );
}
