-- Create a function to handle order assignment transaction
CREATE OR REPLACE FUNCTION assign_order(p_order_id TEXT, p_partner_id TEXT)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Start transaction
    BEGIN
        -- Update order status and assigned partner
        UPDATE orders
        SET status = 'assigned',
            assigned_to = p_partner_id,
            updated_at = NOW()
        WHERE _id = p_order_id
        AND status = 'pending';

        -- Increment partner's current load
        UPDATE delivery_partners
        SET current_load = current_load + 1
        WHERE _id = p_partner_id
        AND current_load < 3;

        -- Create successful assignment record
        INSERT INTO assignments (
            order_id,
            partner_id,
            timestamp,
            status
        ) VALUES (
            p_order_id,
            p_partner_id,
            NOW(),
            'success'
        );

        -- Commit transaction
        COMMIT;
    EXCEPTION WHEN OTHERS THEN
        -- Rollback transaction on error
        ROLLBACK;
        -- Create failed assignment record
        INSERT INTO assignments (
            order_id,
            partner_id,
            timestamp,
            status,
            reason
        ) VALUES (
            p_order_id,
            p_partner_id,
            NOW(),
            'failed',
            SQLERRM
        );
        RAISE;
    END;
END;
$$;
