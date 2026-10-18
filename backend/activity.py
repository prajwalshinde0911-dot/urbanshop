from database import supabase


def log_activity(admin_id, action, entity, entity_id=None, details=None):
    try:
        supabase.table("activity_log").insert({
            "admin_id": admin_id,
            "action": action,
            "entity": entity,
            "entity_id": str(entity_id) if entity_id else None,
            "details": details,
        }).execute()
    except Exception as e:
        print("Activity log failed:", e)
