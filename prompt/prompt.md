# Import the optimizer
from dspy.teleprompt import MIPROv2

# Initialize optimizer
teleprompter = MIPROv2(
    metric=gsm8k_metric,
    auto="light", # Can choose between light, medium, and heavy optimization runs
)

# Optimize program
print(f"Optimizing zero-shot program with MIPRO...")
zeroshot_optimized_program = teleprompter.compile(
    program.deepcopy(),
    trainset=trainset,
    max_bootstrapped_demos=0, # ZERO FEW-SHOT EXAMPLES
    max_labeled_demos=0, # ZERO FEW-SHOT EXAMPLES
    requires_permission_to_run=False,
)

# Save optimize program for future use
zeroshot_optimized_program.save(f"mipro_zeroshot_optimized")

# Evaluate optimized program
print(f"Evaluate optimized program...")
evaluate(zeroshot_optimized_program, devset=devset[:])