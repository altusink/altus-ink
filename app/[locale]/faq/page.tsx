// Server Component
// Force dynamic rendering - REMOVED
// export const dynamic = 'force-dynamic'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import FAQList from '@/components/FAQList'
import { getTranslations } from 'next-intl/server'

export default async function FAQPage() {
    // Implicit locale handling


    return (
        <div className="min-h-screen">
            <Navbar />
            <FAQList />
            <Footer />
        </div>
    )
}
