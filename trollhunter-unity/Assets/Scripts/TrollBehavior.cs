using System.Collections;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;

public class TrollBehavior : MonoBehaviour {

	public static readonly List<long> LevelToExperience = new List<long> {0, 100, 200, 300, 400};

	public enum LifeCycle {
		EGG,
		BABY,
		ADULT,
	}

	public struct InternalParameter {
		public long experience;
	}

	private LifeCycle lifeCycle;

	private InternalParameter parameter;

	private TrollPhenotypes phenotypes;

	public void UpdatePhenotype() {
		var parts = phenotypes.GetAvailableParts(lifeCycle);
		// Implement mapping function here.
		Dictionary<string, string> stub = new Dictionary<string, string> {
			{"eye", "mean"},
			{"feet", "tiny"},
		};
		phenotypes.RenderParts(stub);
	}

	public long GetLevel() {
		return LevelToExperience.IndexOf(LevelToExperience.First(x => x <= parameter.experience));
	}

	public void Feed(Food f) {
		// Stub!
		parameter.experience++;
	}

	// Use this for initialization
	void Start () {

	}

	// Update is called once per frame
	void Update () {

	}
}
