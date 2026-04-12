import { corsHeaders } from "@supabase/supabase-js/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { batch_size = 20, offset = 0 } = await req.json().catch(() => ({}));

    // Fetch a batch of posts to rewrite
    const { data: posts, error } = await supabase
      .from("feed_posts")
      .select("*")
      .order("post_number")
      .range(offset, offset + batch_size - 1);

    if (error) throw error;
    if (!posts || posts.length === 0) {
      return new Response(JSON.stringify({ message: "No more posts", processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let processed = 0;
    const errors: string[] = [];

    // Process each post with AI
    for (const post of posts) {
      try {
        const bookTitle = post.book_title_author || "Unknown Book";
        const themes = (post.themes || []).join(", ");
        const rawContent = post.post_title_description || "";

        // Extract any usable context from the raw OCR content
        const contentPreview = rawContent.substring(0, 500);

        const prompt = `You are a health & wellness content curator for a women's wellness app called Signal.

Rewrite this feed post based on the book "${bookTitle}" with themes: ${themes}.

Here is the raw content from the book (it may be poorly formatted OCR text):
"""
${contentPreview}
"""

Create a well-structured post with EXACTLY this format (use markdown):

**[Compelling title - a key insight from this book in 6-10 words]**

[2-3 paragraph body explaining this insight in a practical, actionable way. Write for women aged 25-50 who care about health, wellness, hormones, nutrition, movement, mindfulness, or personal growth. Make it feel like advice from a knowledgeable friend. 150-250 words. Do NOT reference exercises, poses, or steps that aren't included in the text. Keep it conceptual and actionable.]

**Takeaway:** [One clear, memorable sentence summarizing the key action or mindset shift]

*"[A real or paraphrased quote that genuinely relates to the insight above — from the book or a well-known figure in this field]"*

IMPORTANT RULES:
- The title, body, takeaway, and quote MUST all relate to the same core idea
- Do NOT reference specific exercises, poses, numbered steps, or "see below" content
- Do NOT use OCR artifacts or random sentences as the takeaway
- The quote must be relevant to the insight, not a random sentence
- Write in second person ("you") 
- Keep it warm, evidence-informed, and practical
- No fluff, no generic wellness platitudes`;

        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-lite",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 800,
          }),
        });

        if (!response.ok) {
          errors.push(`Post ${post.post_number}: API error ${response.status}`);
          continue;
        }

        const aiData = await response.json();
        const rewritten = aiData.choices?.[0]?.message?.content?.trim();

        if (!rewritten || rewritten.length < 100) {
          errors.push(`Post ${post.post_number}: Response too short`);
          continue;
        }

        // Update the post
        const { error: updateError } = await supabase
          .from("feed_posts")
          .update({ post_title_description: rewritten })
          .eq("id", post.id);

        if (updateError) {
          errors.push(`Post ${post.post_number}: Update error: ${updateError.message}`);
        } else {
          processed++;
        }

        // Small delay to avoid rate limiting
        await new Promise((r) => setTimeout(r, 300));
      } catch (e) {
        errors.push(`Post ${post.post_number}: ${e.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        processed,
        total_in_batch: posts.length,
        next_offset: offset + batch_size,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
