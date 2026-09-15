import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = 'https://lyvmtptfskzzxspvlkzu.supabase.co'
const SUPABASE_ANON = 'sb_publishable_QmxKfG2oQPIFuRUzqC2bOQ_KYAdE9YD'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

// Лимиты по тарифу
export const LIMITS = {
    seeker: { collections_per_element: 3,  materials_per_collection: 5  },
    keeper: { collections_per_element: 20, materials_per_collection: 50 },
    // keeper: итого до 80 коллекций (20 на каждую из 4 стихий)
}

// Получить текущего пользователя + профиль
export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
    return profile ? { ...user, profile } : null
}

// Проверить лимит коллекций
export async function checkCollectionLimit(userId, element, tier) {
    // Оба тарифа проверяют лимит по стихии
    // seeker: 3 на стихию, keeper: 20 на стихию (итого до 80)
    const { count } = await supabase
        .from('collections')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('element', element)
    const limit = tier === 'keeper'
        ? LIMITS.keeper.collections_per_element
        : LIMITS.seeker.collections_per_element
    return count < limit
}

// Проверить лимит материалов
export async function checkMaterialLimit(collectionId, tier) {
    const { count } = await supabase
        .from('materials')
        .select('*', { count: 'exact', head: true })
        .eq('collection_id', collectionId)
    const limit = tier === 'keeper'
        ? LIMITS.keeper.materials_per_collection
        : LIMITS.seeker.materials_per_collection
    return count < limit
}
