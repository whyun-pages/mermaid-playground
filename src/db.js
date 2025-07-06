import { createClient } from '@supabase/supabase-js'

class DB {
    constructor() {
        this.client = createClient(
            import.meta.env.VITE_SUPABASE_URL,
            import.meta.env.VITE_SUPABASE_ANON_KEY
        )
    }
    async init() {
        const { data, error } = await this.client
            .from('mermaid')
            .select()
        if (error) {
            console.error(error)
        } else {
            console.log(data)
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DB().init();
}); 