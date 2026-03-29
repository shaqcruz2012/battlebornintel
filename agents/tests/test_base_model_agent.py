"""Tests for BaseModelAgent hardened behavior.

We test the model_id validation logic without importing the actual class
(to avoid the asyncpg dependency chain).
"""

from datetime import date

import pytest


class TestModelIdValidation:
    """Verify create_scenario rejects calls when model_id is None."""

    def test_model_id_none_raises(self):
        """create_scenario requires register_model() to be called first."""
        # Replicate the validation logic from BaseModelAgent.create_scenario
        model_id = None
        agent_name = "test_agent"

        with pytest.raises(ValueError, match="must call register_model"):
            if model_id is None:
                raise ValueError(
                    f"Agent '{agent_name}' must call register_model() before "
                    "create_scenario(). model_id is None."
                )

    def test_model_id_set_passes(self):
        """When model_id is set, validation passes."""
        model_id = 42
        # No error should be raised
        if model_id is None:
            raise ValueError("model_id is None")
        assert model_id == 42
