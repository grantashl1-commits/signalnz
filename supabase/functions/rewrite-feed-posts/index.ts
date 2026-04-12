const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Known book premises to give AI context about what each book is actually about
const BOOK_CONTEXT: Record<string, string> = {
  "atomic habits": "Building good habits and breaking bad ones through tiny changes, habit stacking, and identity-based behaviour change.",
  "the body keeps the score": "How trauma reshapes the body and brain, and paths to recovery through movement, mindfulness, and connection.",
  "braving the wilderness": "Finding true belonging by standing alone when necessary, showing up authentically, and embracing vulnerability.",
  "untamed": "Reclaiming your true self as a woman by unlearning societal conditioning and trusting your inner knowing.",
  "women who run with the wolves": "Reconnecting with the wild feminine instinct through myths, fairy tales, and archetypal psychology.",
  "why we sleep": "The science of sleep — why it's essential for memory, immunity, emotional regulation, and longevity.",
  "breath": "The lost art of breathing and how changing how you breathe can transform health, performance, and wellbeing.",
  "the four agreements": "Ancient Toltec wisdom distilled into four principles: be impeccable with your word, don't take anything personally, don't make assumptions, always do your best.",
  "in the flo": "Aligning nutrition, exercise, and productivity with the four phases of the menstrual cycle.",
  "womancode": "Balancing hormones naturally through food, movement, and lifestyle aligned with your cycle.",
  "roar": "Female-specific sports science — how women's physiology differs and how to train, fuel, and recover accordingly.",
  "the daily stoic": "366 meditations on wisdom, perseverance, and the art of living drawn from Stoic philosophy.",
  "meditations": "Marcus Aurelius' private journal of Stoic reflections on duty, mortality, resilience, and inner peace.",
  "the obstacle is the way": "Using Stoic principles to turn adversity into advantage through perception, action, and will.",
  "feeling good": "Cognitive behavioural techniques for overcoming depression, anxiety, and negative thought patterns.",
  "the gifts of imperfection": "Letting go of who you think you should be and embracing who you are through courage, compassion, and connection.",
  "daring greatly": "The power of vulnerability as a source of courage, creativity, and meaningful connection.",
  "rising strong": "How to get back up after failure by reckoning with emotions, rumbling with stories, and revolutionising your narrative.",
  "the happiness project": "A year-long experiment in applying research-backed strategies to boost everyday happiness.",
  "gut": "The science of digestion and how your gut microbiome influences mood, immunity, and overall health.",
  "clean": "A program for removing toxins and restoring the body's natural healing ability through clean eating.",
  "food rules": "Simple, memorable guidelines for eating well — mostly plants, not too much, real food.",
  "how not to die": "Evidence-based nutrition showing how a plant-rich diet can prevent and reverse chronic disease.",
  "the dorito effect": "How artificial flavours have hijacked our taste buds and disconnected us from real nutrition.",
  "mindset": "The difference between fixed and growth mindsets and how your beliefs about ability shape your success.",
  "ikigai": "The Japanese concept of finding your reason for being through the intersection of passion, mission, profession, and vocation.",
  "but he says he loves me": "Recognising manipulation tactics in relationships — how controlling partners use charm, isolation, and gaslighting.",
  "but im bored": "Helping children develop creativity, independence, and deep play without constant entertainment or screens.",
  "the tao of pooh": "Explaining Taoist principles through Winnie-the-Pooh — simplicity, spontaneity, and the uncarved block.",
  "sapiens": "A brief history of humankind — how Homo sapiens came to dominate Earth through cognitive, agricultural, and scientific revolutions.",
  "educated": "A memoir of growing up in a survivalist family and the transformative power of education and self-invention.",
  "maybe you should talk to someone": "A therapist's own journey through therapy, exploring how we change and what connects us all.",
  "when the body says no": "The connection between chronic stress, repressed emotions, and illness — learning to listen to your body's signals.",
  "burnout": "The science of stress, why women experience it differently, and how to complete the stress cycle.",
  "come as you are": "The science of female sexuality — how desire, arousal, and pleasure actually work.",
  "period power": "Understanding your menstrual cycle as a source of power and using each phase to your advantage.",
  "fix your period": "A practical guide to addressing period problems through nutrition, supplements, and lifestyle changes.",
};

function getBookContext(bookTitle: string): string {
  const lower = bookTitle.toLowerCase();
  for (const [key, context] of Object.entries(BOOK_CONTEXT)) {
    if (lower.includes(key)) return context;
  }
  return "";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { batch_size = 10 } = await req.json().catch(() => ({}));

    // Find posts that still need quality fixing: too long (raw text) or missing structure
    const { data: allPosts, error: fetchError } = await supabase
      .from("feed_posts")
      .select("*")
      .order("post_number")
      .limit(1000);

    if (fetchError) throw fetchError;

    // Filter for posts that need rewriting
    const needsWork = (allPosts || []).filter((p: any) => {
      const text = p.post_title_description || "";
      // Raw book text (too long)
      if (text.length > 600) return true;
      // Missing proper structure
      if (!text.includes("**Takeaway:**")) return true;
      // Title repeated verbatim in body
      const lines = text.split("\n").filter((l: string) => l.trim());
      if (lines.length >= 2) {
        const titleText = lines[0].replace(/\*\*/g, "").trim();
        if (titleText.length > 10 && lines.slice(1).join(" ").includes(titleText)) return true;
      }
      // Starts without a bold title
      if (!text.startsWith("**")) return true;
      return false;
    });

    const posts = needsWork.slice(0, batch_size);

    if (posts.length === 0) {
      return new Response(JSON.stringify({ 
        message: "All posts look good!", 
        processed: 0,
        remaining: 0
      }), {
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
        const bookContext = getBookContext(bookTitle);

        const prompt = `You are a wellness content writer for "Signal", an app for women aged 25-50.

YOUR TASK: Transform this raw book extract into a polished micro-insight.

STEP 1 — UNDERSTAND THE SOURCE
Book: "${bookTitle}"
${bookContext ? `Book premise: ${bookContext}` : ""}
Themes: ${themes}

Raw extract (may be messy OCR text, raw paragraphs, or incomplete):
"""
${rawContent.substring(0, 800)}
"""

STEP 2 — IDENTIFY THE SINGLE KEY IDEA
Read the raw text carefully. What is the ONE practical insight or perspective shift a reader should take away? If the raw text is incoherent, use the book's known premise and themes to reconstruct a meaningful insight that this passage was likely about.

STEP 3 — WRITE THE MICRO-ARTICLE
Use this exact markdown format:

**[6-10 word title capturing the key insight]**

[2-3 short paragraphs. Warm, conversational, second person ("you"). Explain the idea, why it matters, and how to apply it. NO lists, NO numbered steps, NO exercise names, NO "see below" references. 120-180 words.]

**Takeaway:** [One clear, actionable sentence that captures what to do or think differently.]

*"[A real, well-known quote from ${bookTitle.split("—")[1]?.trim() || "the author"} that directly relates to this insight. If you're unsure of the exact quote, use a widely attributed quote from this author on this topic.]"*

RULES:
- Title, body, takeaway, and quote must ALL connect to the SAME idea
- Do NOT repeat the title wording in the first sentence of the body
- Total length: 150-250 words maximum
- If the raw text makes no sense, infer the insight from the book's premise + themes
- The takeaway must be a statement, not a question
- The quote must feel intentional and relevant
- No OCR artifacts, page numbers, copyright notices, or incomplete sentences
- Write as if you deeply understand this book, not as if you're reformatting text`;

        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 700,
          }),
        });

        if (!response.ok) {
          const status = response.status;
          if (status === 429) {
            // Rate limited — stop batch and report
            errors.push(`Rate limited at post ${post.post_number}. Stopping batch.`);
            break;
          }
          errors.push(`Post ${post.post_number}: API error ${status}`);
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
        if (boldIdx > 0 && boldIdx < 150) {
          rewritten = rewritten.substring(boldIdx);
        }

        // Validate structure
        if (!rewritten.includes("**Takeaway:**")) {
          errors.push(`Post ${post.post_number}: Missing takeaway structure`);
          continue;
        }

        // Validate length — reject if AI went too long
        if (rewritten.length > 1500) {
          errors.push(`Post ${post.post_number}: Response too long (${rewritten.length} chars)`);
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
          if (examples.length < 3) {
            examples.push(`#${post.post_number} (${bookTitle}): ${rewritten.substring(0, 120)}...`);
          }
        }

        // Delay to avoid rate limiting
        await new Promise((r) => setTimeout(r, 500));
      } catch (e) {
        errors.push(`Post ${post.post_number}: ${(e as Error).message}`);
      }
    }

    return new Response(
      JSON.stringify({
        processed,
        total_in_batch: posts.length,
        remaining: needsWork.length - processed,
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
