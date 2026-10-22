import { computed } from 'vue'
import store from '../store'

export function useDirectoryData() {
  const micronationsDirectory = computed(() => store.getters.micronations)
  const organizationsDirectory = computed(() => store.getters.organizations)
  const moderatorsList = computed(() => store.getters.moderators)
  const user = computed(() => store.getters.user)

  return {
    micronationsDirectory,
    visibleMicronations: computed(() => micronationsDirectory.value.filter(
      (entry) => entry.approved && entry.searchDisplay && entry.filterDisplay
    )),
    supranationalMicronations: computed(() => micronationsDirectory.value.filter((entry) => entry.supranational)),
    micronationsApprovedDirectory: computed(() => micronationsDirectory.value.filter((entry) => entry.approved)),
    physicalMicronationsDirectory: computed(() => store.getters.physicalMicronations),
    organizationsDirectory,
    visibleOrganizations: computed(() => organizationsDirectory.value.filter(
      (entry) => entry.approved && entry.searchDisplay && entry.filterDisplay
    )),
    organizationsModerationDirectory: computed(() => organizationsDirectory.value.filter(
      (entry) => !entry.approved && entry.searchDisplay && entry.filterDisplay
    )),
    organizationsApprovedDirectory: computed(() => organizationsDirectory.value.filter((entry) => entry.approved)),
    moderatorsList,
    userIsModerator: computed(() => moderatorsList.value.includes(user.value?.email)),
    user
  }
}
