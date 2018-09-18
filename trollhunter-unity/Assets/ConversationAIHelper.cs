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
	public bool query(string text, Callback callback) {
		// Stub
		Score score = getDummyScore(text);
		callback.score(score);
		return true;
	}

	private Score getDummyScore(string text) {
		Score score = new Score();
		score.toxicity = 1.0F / (float) text.Length;
		score.severeToxicity = score.toxicity / 2.0F;
		score.inflammatory = (float) random.NextDouble();

		return score;
	}
}
