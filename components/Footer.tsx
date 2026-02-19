import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-neutral-900 border-t border-neutral-800 text-gray-500 py-8">
            <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                    <p>&copy; {new Date().getFullYear()} Photography Portfolio. All rights reserved.</p>
                </div>
                <div className="flex items-center gap-6">
                    <Link href="/albums" className="hover:text-white transition">Client Albums</Link>
                    <Link href="/admin/login" className="hover:text-white transition text-sm border border-neutral-700 px-3 py-1 rounded">
                        Photographer Login
                    </Link>
                </div>
            </div>
        </footer>
    );
}
