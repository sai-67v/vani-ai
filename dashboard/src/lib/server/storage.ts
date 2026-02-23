import { getSupabaseServer } from "./supabaseServer";

const BUCKET = "tts-audio";

export async function uploadAudioToSupabase(filename: string, audio: Buffer, contentType = "audio/mpeg") {
    const supabase = getSupabaseServer();
    if (!supabase) return null;

    try {
        // Ensure bucket
        await supabase.storage.createBucket(BUCKET, { public: true }).catch(() => {});
        const { error } = await supabase.storage.from(BUCKET).upload(filename, audio, {
            contentType,
            upsert: true,
        });
        if (error) throw error;
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
        return data.publicUrl;
    } catch (err) {
        console.error("[uploadAudioToSupabase]", err);
        return null;
    }
}
