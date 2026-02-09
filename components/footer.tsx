import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="bg-card border-t border-border py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Ziren Printing Shop Logo"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
            />
            <div>
              <p className="font-bold text-primary">ZIREN</p>
              <p className="text-xs text-muted-foreground">Printing Shop</p>
            </div>
          </div>

          <nav className="flex flex-wrap justify-center gap-6">
            <Link
              href="#services"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Services
            </Link>
            <Link
              href="#pricing"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="#about"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              About
            </Link>
            <Link
              href="#faq"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              FAQ
            </Link>
            <Link
              href="#contact"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Contact
            </Link>
          </nav>

          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Ziren Printing Shop. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
