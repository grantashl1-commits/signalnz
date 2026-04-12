const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
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
    const { batch_size = 20, mode = "quality_fix" } = await req.json().catch(() => ({}));

    let posts;
    if (mode === "quality_fix") {
      // Find posts where title is repeated in body, or takeaway is disconnected, or content >1200 chars (likely raw OCR)
      const { data, error } = await supabase
        .from("feed_posts")
        .select("*")
        .or("post_title_description.not.ilike.%**Takeaway:**%")
        .order("post_number")
        .limit(batch_size);
      
      if (error) throw error;
      
      // If no posts without takeaway, find ones that are too long (raw text)
      if (!data || data.length === 0) {
        const { data: longPosts, error: longError } = await supabase
          .from("feed_posts")
          .select("*")
          .order("post_number")
          .limit(1000);
        if (longError) throw longError;
        
        // Filter for quality issues: body >1200 chars, title repeated in body, disconnected content
        posts = (longPosts || []).filter((p: any) => {
          const text = p.post_title_description || "";
          // Too long means likely raw book text
          if (text.length > 1200) return true;
          // Title line repeated in body
          const lines = text.split("\n").filter((l: string) => l.trim());
          if (lines.length >= 2) {
            const titleLine = lines[0].replace(/\*\*/g, "").trim();
            const bodyText = lines.slice(1).join(" ");
            if (bodyText.includes(titleLine)) return true;
          }
          return false;
        }).slice(0, batch_size);
      } else {
        posts = data;
      }
    } else {
      // Process all posts sequentially by offset
      const { offset = 0 } = await req.json().catch(() => ({}));
      const { data, error } = await supabase
        .from("feed_posts")
        .select("*")
        .order("post_number")
        .range(offset, offset + batch_size - 1);
      if (error) throw error;
      posts = data;
    }

    if (!posts || posts.length === 0) {
      return new Response(JSON.stringify({ message: "No more posts to process", processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let processed = 0;
    const errors: string[] = [];
    const examples: string[] = [];

    for (const post of posts) {
      try {
        const bookTitle = post.book_title_author || "Unknown Book";
        const themes = (post.themes || []).join(", ");
        const rawContent = post.post_title_description || "";

        const prompt = `You are a wellness content writer for "Signal", an app for women aged 25-50.

Rewrite this into a SHORT, focused micro-article (150-200 words max). The entire post MUST revolve around ONE single idea.

Source book: "${bookTitle}"
Themes: ${themes}

Raw content:
"""
${rawContent.substring(0, 600)}
"""

FORMAT (use markdown exactly like this):
**[6-10 word title capturing the ONE key insight]**

[2-3 short paragraphs. Practical, warm, conversational. Written in second person ("you"). NO lists, NO numbered steps, NO exercise names, NO "see below" references. Keep it conceptual and actionable. 150-200 words MAXIMUM.]

**Takeaway:** [One sentence that directly summarises the insight from the paragraphs above. Must logically follow from the body text.]

*"[A real quote from the book's author or a well-known figure in this field that DIRECTLY relates to the same insight. Not a random sentence from the book.]"*

CRITICAL RULES:
- Title, body, takeaway, and quote must ALL be about the SAME idea
- Do NOT repeat the title sentence in the body
- Keep total length under 250 words
- The takeaway must be a clear action or mindset shift, not a question
- The quote must feel intentional, not random
- No OCR artifacts, no incomplete sentences
- No references to specific exercises, poses, or page numbers`;

        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 600,
          }),
        });

        if (!response.ok) {
          errors.push(`Post ${post.post_number}: API error ${response.status}`);
          continue;
        }

        const aiData = await response.json();
        let rewritten = aiData.choices?.[0]?.message?.content?.trim();

        if (!rewritten || rewritten.length < 80) {
          errors.push(`Post ${post.post_number}: Response too short`);
          continue;
        }

        // Strip any AI preamble before the markdown title
        const boldIdx = rewritten.indexOf("**");
        if (boldIdx > 0 && boldIdx < 120) {
          rewritten = rewritten.substring(boldIdx);
        }

        // Validate structure
        if (!rewritten.includes("**Takeaway:**")) {
          errors.push(`Post ${post.post_number}: Missing takeaway structure`);
          continue;
        }

        const { error: updateError } = await supabase
          .from("feed_posts")
          .update({ post_title_description: rewritten })
          .eq("id", post.id);

        if (updateError) {
          errors.push(`Post ${post.post_number}: Update error: ${updateError.message}`);
        } else {
          processed++;
          if (examples.length < 2) {
            examples.push(`#${post.post_number}: ${rewritten.substring(0, 100)}...`);
          }
        }

        // Small delay to avoid rate limiting
        await new Promise((r) => setTimeout(r, 300));
      } catch (e) {
        errors.push(`Post ${post.post_number}: ${(e as Error).message}`);
      }
    }

    return new Response(
      JSON.stringify({
        processed,
        total_in_batch: posts.length,
        errors: errors.length > 0 ? errors : undefined,
        examples,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
