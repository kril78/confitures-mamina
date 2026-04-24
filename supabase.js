// ===================================
// CONFIGURATION SUPABASE
// ===================================

const SUPABASE_URL = 'https://csfybuftonpewqytxwpk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzZnlidWZ0b25wZXdxeXR4d3BrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMTAzMzgsImV4cCI6MjA5MjU4NjMzOH0.DLyq_zU4AzNWqT6rcz6tQw26groCxiUL8Pt3SzIIl-o';

const db = {
    async get(table) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        return res.json();
    },

async add(table, data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify(data)
    });
    const json = await res.json();
    console.log('Supabase response:', json);
    return json;
},

    async delete(table, id) {
        await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
            method: 'DELETE',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
    },

    async update(table, id, data) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
            method: 'PATCH',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return res.json();
    }
};
