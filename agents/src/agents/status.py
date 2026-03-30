"""Canonical status strings for agent execution results.

All agents should use these constants instead of raw strings to ensure
consistency across the system and enable reliable status checking.
"""


class AgentStatus:
    COMPLETED = "completed"
    NO_DATA = "no_data"
    INSUFFICIENT_DATA = "insufficient_data"
    SKIPPED = "skipped"
    FAILED = "failed"
    # Sub-analysis statuses (nested in result dicts)
    COMPLETED_FALLBACK = "completed_fallback"
    NO_SPILLOVER_DATA = "no_spillover_data"
    INSUFFICIENT_CLASS_BALANCE = "insufficient_class_balance"
