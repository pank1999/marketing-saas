import './global.css';

export const metadata = {
  title: 'Marketing SaaS Platform',
  description: 'A powerful marketing platform for your business',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className="h-full">{children}</body>
    </html>
  );
}
