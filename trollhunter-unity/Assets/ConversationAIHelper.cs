using System.Collections;
using System.Collections.Generic;
using UnityEngine;

// Helper class that connects to Conversation AI.
public class ConversationAIHelper {
	System.Random random = new System.Random();

	public interface Callback {
		void score(Score score);
	}

	// Query the ConversationAI.
	public bool Query(string text, Callback callback) {
		// Stub
		Score score = getDummyScore(text);
		callback.score(score);
		return true;
	}

	private Score getDummyScore(string text) {
		Score score = new Score();
		score.Toxicity = 1.0F / (float) text.Length;
		score.SevereToxicity = score.toxicity / 2.0F;
		score.Inflammatory = (float) random.NextDouble();

		return score;
	}
}
