using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class TrollPhenotypes {
	public Dictionary<string, List<string>> GetAvailableParts(TrollBehavior.LifeCycle lifeCycle) {
		// Stub!
		return new Dictionary<string, List<string>> {
			{"eyes", new List<string> {"mean", "goofee"}},
			{"feet", new List<string> {"huge", "tiny"}},
		};
	}

	public void RenderParts(Dictionary<string, string> visibleParts) {
		// Example argument: feed {{"eyes", "mean"}, {"feet", "huge"}}
		// Stub!
	}
}
