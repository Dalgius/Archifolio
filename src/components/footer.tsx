export function Footer() {
  return (
    <footer className="mt-auto py-6 px-6 border-t bg-background">
      <div className="container mx-auto text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Archifolio. Built with Next.js and Firebase.</p>
      </div>
    </footer>
  )
}
