#!/usr/bin/env ruby
# frozen_string_literal: true
# Run from repository root: ruby scripts/check_entity_network.rb
require "yaml"

catalog = YAML.safe_load_file("_data/catalog.yaml", aliases: true)
components = YAML.safe_load_file("_data/component_catalog.yaml", aliases: true)
relations = YAML.safe_load_file("_data/entity_relations.yaml", aliases: true)
nodes = YAML.safe_load_file("_data/entity_nodes.yaml", aliases: true)
families = YAML.safe_load_file("_data/product_families.yaml", aliases: true)

entries = catalog.flat_map { |group, items| items.map { |item| [group, item] } }
ids = entries.map { |_, item| item.fetch("entity_id") }
raise "Duplicate or missing entity_id" unless ids.size == ids.uniq.size
by_id = entries.to_h { |group, item| [item.fetch("entity_id"), [group, item]] }
component_ids = []
components.each do |_, items|
  items.each do |component|
    id = component.fetch("id")
    component_ids << id
    record = by_id[id]
    raise "Component with no canonical entry: #{id}" unless record
    raise "Wrong source group for #{id}" unless component.fetch("source_group") == record[0]
    raise "Ecosystem duplicated in components: #{id}" if component.key?("ecosystems")
  end
end
raise "Duplicate component ID" unless component_ids.size == component_ids.uniq.size

edge_ids = []
relations.each do |edge|
  from = edge.fetch("from")
  to = edge["to"]
  raise "Missing source #{from}" unless by_id.key?(from)
  if to
    known = by_id.key?(to) || nodes.key?(to) || (to.start_with?("family-") && families.key?(to.delete_prefix("family-")))
    raise "Missing target #{to}" unless known
  elsif edge["external_name"].to_s.empty? || edge["external_url"].to_s.empty?
    raise "External relation missing name or URL: #{edge}"
  end
  if edge["type"] == "family_member" || edge["type"] == "ecosystem_member"
    raise "Invalid family relation: #{edge}" unless to&.start_with?("family-")
  end
  edge_ids << [from, to || edge["external_name"], edge.fetch("type")]
end
raise "Duplicate relations" unless edge_ids.size == edge_ids.uniq.size

nodes.each do |node_id, node|
  next unless node["related_entity"]
  raise "Unknown node member: #{node_id}" unless by_id.key?(node["related_entity"])
end

%w[python pycharm akshare streamlit pytorch vscode].each do |id|
  raise "Missing expected entity #{id}" unless by_id.key?(id)
end
def connected?(relations, from, to, kind)
  relations.any? { |r| r["from"] == from && r["to"] == to && r["type"] == kind }
end
raise "AKShare not linked to Python" unless connected?(relations, "akshare", "ecosystem-python", "ecosystem")
raise "Streamlit not linked to Python" unless connected?(relations, "streamlit", "ecosystem-python", "ecosystem")
raise "PyCharm language support missing" unless connected?(relations, "pycharm", "python", "supports_language")
raise "JetBrains vendor missing" unless connected?(relations, "pycharm", "vendor-jetbrains", "vendor")

puts "PASS: #{ids.size} unique entries, #{component_ids.size} components, #{relations.size} typed relationships, #{nodes.size} virtual nodes."
