
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function seed() {
    console.log('🌱 Seeding Artist: Danilo Santos...')
    
    const artist = {
        name: 'Danilo Santos',
        stage_name: 'Danilo Santos', // New Field
        slug: 'danilo-santos',
        bio: 'Especialista em Realismo e Fineline. CEO da Altus Ink.',
        specialties: ['Realismo', 'Fineline', 'Blackwork'],
        is_active: true,
        photo_url: 'https://images.unsplash.com/photo-1590403758368-6c84b42337d0?q=80&w=1000' // Placeholder
    }

    const { data, error } = await supabase
        .from('artists')
        .upsert(artist, { onConflict: 'slug' })
        .select()

    if (error) {
        console.error('❌ Error seeding artist:', error)
    } else {
        console.log('✅ Artist seeded:', data[0].stage_name)
    }
}

seed()
