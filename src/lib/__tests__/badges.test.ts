import { describe, expect, it } from "bun:test";
import { ProfileBadges, getActiveBadges } from "../badges";

describe("Profile Badges Bitmask Logic", () => {
  it("should have correct bit flags", () => {
    expect(ProfileBadges.VERIFIED).toBe(1);
    expect(ProfileBadges.STAFF).toBe(2);
    expect(ProfileBadges.EARLY_USER).toBe(4);
    expect(ProfileBadges.PARTNER).toBe(8);
  });

  it("should return empty array when flags is 0 or negative", () => {
    expect(getActiveBadges(0)).toEqual([]);
    expect(getActiveBadges(-1 & 0)).toEqual([]);
  });

  it("should extract single badge flags correctly", () => {
    const verified = getActiveBadges(ProfileBadges.VERIFIED);
    expect(verified.length).toBe(1);
    expect(verified[0].name).toBe("verified");

    const staff = getActiveBadges(ProfileBadges.STAFF);
    expect(staff.length).toBe(1);
    expect(staff[0].name).toBe("staff");
  });

  it("should extract multiple combined badge flags", () => {
    const combined = ProfileBadges.VERIFIED | ProfileBadges.EARLY_USER | ProfileBadges.PARTNER;
    const badges = getActiveBadges(combined);
    const names = badges.map((b) => b.name);

    expect(badges.length).toBe(3);
    expect(names).toContain("verified");
    expect(names).toContain("early_user");
    expect(names).toContain("partner");
    expect(names).not.toContain("staff");
  });

  it("should return all 4 badges when all flags are active", () => {
    const allFlags =
      ProfileBadges.VERIFIED |
      ProfileBadges.STAFF |
      ProfileBadges.EARLY_USER |
      ProfileBadges.PARTNER;

    const badges = getActiveBadges(allFlags);
    expect(badges.length).toBe(4);
  });
});
