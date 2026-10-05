import { createAdminClient } from "@/lib/supabase/admin";

export interface SeedOptions {
  force?: boolean;
  email?: string | null;
  fullName?: string | null;
}

/**
 * Seeds comprehensive realistic production-grade data for the given user in Supabase.
 */
export async function seedUserData(userId: string, options: SeedOptions = {}) {
  const supabase = createAdminClient();
  const { force = false, email, fullName } = options;

  // 1. Ensure Profile Exists
  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: userId,
      email: email || "commander@anchor.io",
      full_name: fullName || "Anchor Commander",
      avatar_url: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (profileError) {
    throw new Error(`Failed to ensure user profile: ${profileError.message}`);
  }

  // 2. Check if accounts already exist
  const { count: existingAccountsCount, error: countErr } = await supabase
    .from("accounts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (countErr) {
    throw new Error(`Failed to check existing accounts: ${countErr.message}`);
  }

  if (existingAccountsCount && existingAccountsCount > 0 && !force) {
    return { seeded: false, message: "User data already exists." };
  }

  // If force is requested, clean up user data first
  if (force) {
    await Promise.all([
      supabase.from("transactions").delete().eq("user_id", userId),
      supabase.from("tasks").delete().eq("user_id", userId),
      supabase.from("journal_entries").delete().eq("user_id", userId),
      supabase.from("calendar_events").delete().eq("user_id", userId),
      supabase.from("budget_envelopes").delete().eq("user_id", userId),
      supabase.from("recurring_obligations").delete().eq("user_id", userId),
      supabase.from("projects").delete().eq("user_id", userId),
      supabase.from("sovereign_goals").delete().eq("user_id", userId),
      supabase.from("pinned_maxims").delete().eq("user_id", userId),
    ]);
    await supabase.from("accounts").delete().eq("user_id", userId);
  }

  const today = new Date().toISOString().split("T")[0];
  const currentCycle = today.substring(0, 7); // e.g. "2026-10"

  // 3. Seed Accounts
  const { data: accounts, error: accountsErr } = await supabase
    .from("accounts")
    .insert([
      {
        user_id: userId,
        name: "HDFC Operational Checking",
        type: "checking",
        institution: "HDFC Bank",
        account_number_masked: "•••• 4892",
        balance: 145200.0,
        currency: "INR",
        status: "active",
        trend_label: "+8.4% MoM",
      },
      {
        user_id: userId,
        name: "Zerodha Liquid Yield",
        type: "savings",
        institution: "Zerodha Fund",
        account_number_masked: "•••• 9012",
        balance: 320000.0,
        currency: "INR",
        status: "active",
        trend_label: "+12.1% MoM",
      },
      {
        user_id: userId,
        name: "ICICI Corporate Platinum",
        type: "credit",
        institution: "ICICI Bank",
        account_number_masked: "•••• 7120",
        balance: -42800.0,
        credit_limit: 200000.0,
        currency: "INR",
        status: "active",
        trend_label: "-3.2% vs cap",
      },
      {
        user_id: userId,
        name: "Physical Vault Reserve",
        type: "cash",
        institution: "Anchor Vault",
        account_number_masked: "•••• 0001",
        balance: 15000.0,
        currency: "INR",
        status: "active",
        trend_label: "Stable",
      },
    ])
    .select();

  if (accountsErr || !accounts) {
    throw new Error(`Failed to seed accounts: ${accountsErr?.message}`);
  }

  const primaryAccount = accounts[0];
  const cardAccount = accounts[2];

  // 4. Seed Budget Envelopes
  await supabase.from("budget_envelopes").insert([
    {
      user_id: userId,
      category: "housing_utilities",
      label: "Housing & Utilities",
      allocated_amount: 65000.0,
      currency: "INR",
      cycle: currentCycle,
      icon: "HomeOutlined",
    },
    {
      user_id: userId,
      category: "food_dining",
      label: "Food & Dining",
      allocated_amount: 35000.0,
      currency: "INR",
      cycle: currentCycle,
      icon: "RestaurantOutlined",
    },
    {
      user_id: userId,
      category: "transport_transit",
      label: "Transport & Transit",
      allocated_amount: 15000.0,
      currency: "INR",
      cycle: currentCycle,
      icon: "DirectionsCarOutlined",
    },
    {
      user_id: userId,
      category: "shopping_gear",
      label: "Shopping & Gear",
      allocated_amount: 20000.0,
      currency: "INR",
      cycle: currentCycle,
      icon: "ShoppingBagOutlined",
    },
    {
      user_id: userId,
      category: "health_wellness",
      label: "Health & Wellness",
      allocated_amount: 12000.0,
      currency: "INR",
      cycle: currentCycle,
      icon: "FitnessCenterOutlined",
    },
    {
      user_id: userId,
      category: "knowledge_subs",
      label: "Knowledge & Subs",
      allocated_amount: 8000.0,
      currency: "INR",
      cycle: currentCycle,
      icon: "MenuBookOutlined",
    },
  ]);

  // 5. Seed Projects
  const { data: projects } = await supabase
    .from("projects")
    .insert([
      {
        user_id: userId,
        title: "ANCHOR Core System",
        tag: "CORE SYSTEM",
        description: "Zero-latency sovereign life command center and unified ledger.",
        progress_percentage: 85,
        next_milestone: "Supabase Live Synchronization",
        accent_color: "#2563eb",
        status: "active",
      },
      {
        user_id: userId,
        title: "Q4 Capital Optimization",
        tag: "CAPITAL",
        description: "Automated liquidity sweeps and tax-loss harvesting protocol.",
        progress_percentage: 45,
        next_milestone: "Quarterly Audit Reconciliation",
        accent_color: "#059669",
        status: "active",
      },
      {
        user_id: userId,
        title: "Deep Systems Codex",
        tag: "KNOWLEDGE",
        description: "Documentation of architectural axioms and operating procedures.",
        progress_percentage: 70,
        next_milestone: "Publish Volume 1",
        accent_color: "#7c3aed",
        status: "active",
      },
    ])
    .select();

  const coreProject = projects?.[0];

  // 6. Seed Tasks
  const { error: tasksErr } = await supabase.from("tasks").insert([
    {
      user_id: userId,
      project_id: coreProject?.id || null,
      title: "Reconcile Treasury Accounts & Tax Provision",
      priority: "high",
      category: "finance",
      tab_category: "today",
      due_date: today,
      due_time: "18:00:00",
      due_info: "Due 6:00 PM",
      estimated_minutes: 45,
      is_focus_block: true,
      is_completed: false,
    },
    {
      user_id: userId,
      project_id: coreProject?.id || null,
      title: "Audit Supabase PostgreSQL RLS Policies",
      priority: "high",
      category: "work",
      tab_category: "today",
      due_date: today,
      due_time: "15:30:00",
      due_info: "Due 3:30 PM",
      estimated_minutes: 30,
      is_focus_block: false,
      is_completed: false,
    },
    {
      user_id: userId,
      project_id: coreProject?.id || null,
      title: "Complete Stoic Ledger Evening Inquiry",
      priority: "medium",
      category: "personal",
      tab_category: "today",
      due_date: today,
      due_time: "21:00:00",
      due_info: "Due 9:00 PM",
      estimated_minutes: 20,
      is_focus_block: false,
      is_completed: false,
    },
    {
      user_id: userId,
      project_id: projects?.[1]?.id || null,
      title: "Execute Multi-Asset Quarterly Rebalance",
      priority: "medium",
      category: "finance",
      tab_category: "upcoming",
      due_date: today,
      estimated_minutes: 60,
      is_focus_block: false,
      is_completed: false,
    },
    {
      user_id: userId,
      project_id: coreProject?.id || null,
      title: "Establish Clerk JWT Verification Handshake",
      priority: "high",
      category: "work",
      tab_category: "completed",
      due_date: today,
      is_focus_block: false,
      is_completed: true,
      completed_at: new Date().toISOString(),
    },
  ]);

  if (tasksErr) {
    console.error("Tasks seed error:", tasksErr);
    throw new Error(`Failed to seed tasks: ${tasksErr.message}`);
  }

  // 7. Seed Transactions
  const { error: txErr } = await supabase.from("transactions").insert([
    {
      user_id: userId,
      account_id: primaryAccount.id,
      amount: 185000.0,
      currency: "INR",
      flow_type: "inflow",
      category: "consulting_inflow",
      payee_or_payer: "Apex Strategic Advisory",
      note: "Monthly retainer and architecture deliverables",
      date: today,
      time: "09:00:00",
      payment_method: "direct_deposit",
      status: "cleared",
      is_recurring: false,
    },
    {
      user_id: userId,
      account_id: cardAccount.id,
      amount: -12400.0,
      currency: "INR",
      flow_type: "outflow",
      category: "knowledge_subs",
      payee_or_payer: "AWS Cloud Infrastructure",
      note: "Compute clusters and database hosting",
      date: today,
      time: "10:15:00",
      payment_method: "card",
      status: "cleared",
      is_recurring: true,
    },
    {
      user_id: userId,
      account_id: cardAccount.id,
      amount: -3200.0,
      currency: "INR",
      flow_type: "outflow",
      category: "housing_utilities",
      payee_or_payer: "Airtel Gigabit Fiber",
      note: "Dedicated leased-line uplink",
      date: today,
      time: "11:45:00",
      payment_method: "upi",
      status: "cleared",
      is_recurring: true,
    },
    {
      user_id: userId,
      account_id: primaryAccount.id,
      amount: -650.0,
      currency: "INR",
      flow_type: "outflow",
      category: "food_dining",
      payee_or_payer: "Third Wave Coffee Roasters",
      note: "Artisan pour-over and focus session",
      date: today,
      time: "14:20:00",
      payment_method: "upi",
      status: "cleared",
      is_recurring: false,
    },
    {
      user_id: userId,
      account_id: cardAccount.id,
      amount: -18500.0,
      currency: "INR",
      flow_type: "outflow",
      category: "shopping_gear",
      payee_or_payer: "Herman Miller Support",
      note: "Ergonomic workspace tuning components",
      date: today,
      time: "16:00:00",
      payment_method: "card",
      status: "cleared",
      is_recurring: false,
    },
  ]);

  if (txErr) {
    console.error("Transactions seed error:", txErr);
    throw new Error(`Failed to seed transactions: ${txErr.message}`);
  }

  // 8. Seed Recurring Obligations
  await supabase.from("recurring_obligations").insert([
    {
      user_id: userId,
      name: "AWS Enterprise Cloud",
      amount: 12400.0,
      currency: "INR",
      billing_cycle: "monthly",
      renewal_notice: "Renews on the 1st of every month",
      status: "cleared",
      category: "knowledge_subs",
      icon: "CloudQueueOutlined",
    },
    {
      user_id: userId,
      name: "Dedicated Fiber Backbone",
      amount: 3200.0,
      currency: "INR",
      billing_cycle: "monthly",
      renewal_notice: "Direct debit active",
      status: "cleared",
      category: "housing_utilities",
      icon: "WifiOutlined",
    },
    {
      user_id: userId,
      name: "GitHub Team & Copilot",
      amount: 1650.0,
      currency: "INR",
      billing_cycle: "monthly",
      renewal_notice: "Annual contract renewals",
      status: "upcoming",
      category: "knowledge_subs",
      icon: "TerminalOutlined",
    },
  ]);

  // 9. Seed Journal Entry
  await supabase.from("journal_entries").insert([
    {
      user_id: userId,
      date_key: today,
      entry_number: 254,
      title: "Capital Discipline and Execution Velocity",
      snippet: "Maintained absolute operational composure. Reconciled treasury and shipped core APIs.",
      word_count: 480,
      reading_time_minutes: 5,
      mood_tag: "Strategic",
      inquiry_question: "How was today? What did you refrain from reacting to?",
      inquiry_answered: true,
      inquiry_answer:
        "Maintained absolute composure during market volatility. Focused entirely on shipping high-leverage infrastructure without second-guessing decisions.",
      tone_assessment: "Assessed across focus, energy, and decision clarity: Calm & High Agency.",
      content_paragraphs: [
        "Quiet discipline in execution produces asymmetric clarity. When secondary noise increases, the correct response is never to react horizontally—it is to tighten the internal operating system.",
        "Today's treasury reconciliation revealed steady liquidity retention above 68%. Capital allocation remains disciplined and defensive.",
      ],
      quote: "Restraint is power. When life gets chaotic, tighten the system.",
      quote_attribution: "Anchor Codex · Axiom 01",
      observations: [
        {
          title: "Capital Calm:",
          note: "Executed monthly allocation without yielding to impulse hedges.",
        },
        {
          title: "Architecture:",
          note: "Decoupled PostgreSQL RLS policies from Clerk authentication layer.",
        },
      ],
      micro_observations: {
        time: "21:15",
        items: [
          "Completed deep work block without context switching.",
          "Maintained hydration and steady cadence throughout.",
        ],
      },
      linked_project_id: coreProject?.id || null,
      logged_time_info: "Logged at 21:40 · Quiet Office · Room temp 20°C",
      tags: ["#systems", "#clarity", "#discipline", "#engineering"],
      is_pinned: true,
    },
  ]);

  // 10. Seed Pinned Maxim
  await supabase.from("pinned_maxims").insert([
    {
      user_id: userId,
      quote: "Restraint is power. When life gets chaotic, tighten the system.",
      attribution: "Anchor Codex · Axiom 01",
      source_codex: "Anchor Ledger Codex",
      is_active: true,
    },
  ]);

  // 11. Seed Calendar Events
  await supabase.from("calendar_events").insert([
    {
      user_id: userId,
      title: "Q4 Treasury Capital Review",
      date: today,
      time: "11:00:00",
      type: "financial",
      amount: 185000.0,
      note: "Quarterly liquidity position assessment with tax advisory team",
      is_reconciled: true,
    },
    {
      user_id: userId,
      title: "Anchor Infrastructure Release",
      date: today,
      time: "16:30:00",
      type: "task",
      note: "Deploy schema migration and Playwright end-to-end test verification",
      is_reconciled: false,
    },
  ]);

  // 12. Seed Sovereign Goals
  await supabase.from("sovereign_goals").insert([
    {
      user_id: userId,
      title: "Liquid Sovereign Reserve",
      subtitle: "Unencumbered cash and treasury fund backing 18 months of operating burn.",
      target_horizon: "Q4 2026",
      progress_percentage: 82,
      achieved_metric: "Rs. 24.2L Liquid",
      gap_metric: "Rs. 5.8L to target",
      meter_color: "#10b981",
      target_date: "2026-12-31",
    },
    {
      user_id: userId,
      title: "Autonomous SaaS Engine",
      subtitle: "High-margin cashflow generation with minimal operational maintenance.",
      target_horizon: "Q1 2027",
      progress_percentage: 65,
      achieved_metric: "$12.4k MRR",
      gap_metric: "$7.6k to target",
      meter_color: "#3b82f6",
      target_date: "2027-03-31",
    },
  ]);

  return { seeded: true, message: "Comprehensive seed data created successfully." };
}
